#!/opt/homebrew/bin/bash

# --- Configuration ---
ADJECTIVE_FILE="src/assets/adjectives.csv" # CSV file with adjectives (header row, first column)
NOUN_FILE="src/assets/most-common-nouns-english.csv"           # CSV file with nouns (header row, first column)
NUM_IMAGES=100                  # How many images to generate
OUTPUT_DIR="public/images" # Directory to save the images
ACCOUNT_ID="d85c1a22f832cacd74de9477aa1661e0" # Your Cloudflare Account ID
API_TOKEN="lDFbQlPVJV_mbZrRwtLnI6-8TjpaqIqG9pIZCM0i" # Your Cloudflare API Token (BE CAREFUL!)
#API_ENDPOINT="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/runwayml/stable-diffusion-v1-5-inpainting" DON'T KNOW HOW TO USE
#API_ENDPOINT="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/lykon/dreamshaper-8-lcm" VERY BAD
API_ENDPOINT="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning" #almost perfect
#API_ENDPOINT="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0" #almost perfect but takes longer than lightning
#API_ENDPOINT="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell" doesn't work

API_PROMPT_ENDPOINT="https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct"
PROMPT_MAX_TOKENS=24
PROMPT_MAX_WORDS=7
REQUEST_DELAY=5                 # Seconds to wait between requests (IMPORTANT!)
image_index_start=100

# Load base64 image and mask (no newlines)
INIT_IMAGE=$(base64 -i public/images/init.png | tr -d '\n')
MASK_IMAGE=$(base64 -i public/images/mask.png | tr -d '\n')
# --- Script Logic ---

# Function to check file existence and word count (skipping header)
check_csv_file() {
  local filename="$1"
  local min_words="$2"
  local file_type="$3"

  if [ ! -f "$filename" ]; then
    echo "Error: $file_type file '$filename' not found."
    exit 1
  fi

  # Count lines skipping header
  local word_count
  word_count=$(tail -n +2 "$filename" | wc -l)

  echo "Found $word_count words (excluding header) in '$filename'."
  if [ "$word_count" -lt "$min_words" ]; then
    echo "Error: Need at least $min_words words in '$filename' (excluding header)."
    exit 1
  fi
}

# Check input files
check_csv_file "$ADJECTIVE_FILE" 2 "Adjective"
check_csv_file "$NOUN_FILE" 2 "Noun"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"
echo "Saving images to directory: $OUTPUT_DIR"


echo "Starting image generation for $NUM_IMAGES images..."

for (( i=image_index_start; i<=image_index_start+NUM_IMAGES; i++ ))
do
  echo "--- Generating image $i of $(image_index_start+NUM_IMAGES) ---"

  # Get 2 random adjectives (skip header, take first field)
  mapfile -t random_adjectives < <(tail -n +2 "$ADJECTIVE_FILE" | gshuf -n 2 | cut -d ',' -f 1)
  adj1=${random_adjectives[0]}
  adj2=${random_adjectives[1]}

  # Get 2 random nouns (skip header, take first field)
  mapfile -t random_nouns < <(tail -n +2 "$NOUN_FILE" | gshuf -n 4 | cut -d ',' -f 1)
  noun1=${random_nouns[0]}
  noun2=${random_nouns[1]}
  noun3=${random_nouns[2]}
  noun4=${random_nouns[3]}

  # Handle potential case where not enough unique words were read
  if [ -z "$adj1" ] || [ -z "$noun1" ] || [ -z "$noun2" ] || [ -z "$noun3" ] || [ -z "$noun4" ]; then
      echo "Warning: Could not fetch 2 unique adjectives and 2 unique nouns. Skipping iteration $i."
      sleep 1 # Still wait a bit
      continue
  fi

  echo "Words selected: Adjectives='none' | Nouns='$noun1', '$noun2', '$noun3', '$noun4'"

  # Sanitize words for filename
#  filename_adj1=$(echo "$adj1" | tr -s '[:punct:][:space:]' '_')
#  filename_noun1=$(echo "$noun1" | tr -s '[:punct:][:space:]' '_')
#  filename_noun2=$(echo "$noun2" | tr -s '[:punct:][:space:]' '_')
#  filename_noun3=$(echo "$noun3" | tr -s '[:punct:][:space:]' '_')

  json_payload=$(printf '{ "prompt": "Without any excessive words, commentary and in %s plain words, describe a made-up single object, animal, person or scene that combines features or attributes of the following nouns but use NO ADJECTIVES. For example, a dog wearing a shirt surfing in space. Use your own concrete nouns if the following are too abstract. Nouns: %s, %s, %s, %s.", "max_tokens": %s}'  \
    "$PROMPT_MAX_WORDS" "$noun1" "$noun2" "$noun3" "$noun4" "$PROMPT_MAX_TOKENS")

  # Execute the curl command for prompt gen
  prompt_url=$(curl "$API_PROMPT_ENDPOINT" \
    -X POST \
    -H "Authorization: Bearer ${API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$json_payload" \
    --silent \
    --fail | jq -r '.result.response')

  prompt_url=$(echo "$prompt_url" | tr -d "'\"")

    # Check curl exit status for prompt gen
  curl_exit_status=$?
  if [ $curl_exit_status -ne 0 ]; then
      echo "Error: curl command failed with exit status $curl_exit_status for prompt $i."
      exit 1 # Uncomment to stop on first error
#      echo "Continuing to next image..."
  else
      echo "Successfully generated prompt: ${prompt_url}"
  fi


#  Check the jq is extracted correctly
  if [ -z "$prompt_url" ] || [ "$prompt_url" == "null" ]; then
      echo "❌ Error: Failed to extract prompt from JSON."
      exit 1
  fi

  # Create a unique filename
  # output_filename="${OUTPUT_DIR}/${filename_adj1}_${filename_noun3}_${filename_noun1}_${filename_noun2}_${i}.png"
  output_filename="${OUTPUT_DIR}/image_${i}.png"

  # Construct the JSON payload using printf
  # Modify the prompt structure as desired
  json_payload=$(printf '{ "prompt": "A very simple, flat, black-and-white vector-style cartoon illustration of %s. Line art only, minimal detail, white background, no textures, no shading. Clear shapes, thick outlines. Looks like pictogram, not a realistic drawing.",
    "negative_prompt":"high detail, realistic, intricate, photorealistic, shadows, textures, background, color, noise, busy composition",
    "seed": %d,
    "guidance": 5}' \
    "$prompt_url" "$RANDOM")

#  json_payload=$(printf '{ "prompt": "A very simple, flat, black-and-white vector-style cartoon illustration of a %s. Line art only, minimal detail, no background, no textures, no shading. Clear shapes, thick outlines. Looks like a board game icon or pictogram, not a realistic drawing.",
#    "negative_prompt":"high detail, realistic, intricate, photorealistic, shadows, textures, background, color, noise, busy composition",
#    "seed": "%d",
#    "num_steps": 20,
#    "guidance": 5,
#    "image": "%s",
#    "mask_image": "%s"
#  }' "$prompt_url" "$RANDOM" "$INIT_IMAGE" "$MASK_IMAGE")

  echo "Output filename: $output_filename"
  # echo "JSON Payload: $json_payload" # Uncomment to debug

  # Execute the curl command
  curl "$API_ENDPOINT" \
    -H "Authorization: Bearer ${API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$json_payload" \
    --output "$output_filename" \
    --silent \
    --fail

  # Check curl exit status
  curl_exit_status=$?
  if [ $curl_exit_status -ne 0 ]; then
      echo "Error: curl command failed with exit status $curl_exit_status for image $i."
      # exit 1 # Uncomment to stop on first error
      echo "Continuing to next image..."
  else
      echo "Successfully generated: $output_filename"
  fi

  # Wait before the next request
  echo "Waiting for $REQUEST_DELAY seconds..."
  sleep "$REQUEST_DELAY"

done

echo "--- Finished generating $NUM_IMAGES images ---"