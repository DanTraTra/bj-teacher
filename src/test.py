from diffusers import DiffusionPipeline

pipe = DiffusionPipeline.from_pretrained("ByteDance/SDXL-Lightning")

prompt = "Astronaut in a jungle, cold color palette, muted colors, detailed, 8k"
image = pipe(prompt).images[0]