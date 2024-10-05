import React, {useEffect, useState} from "react";

interface Props {
    Count: number;
    handleClickCorrectAnswer: () => void;
    handleClickWrongAnswer: () => void;
}

const CountQuiz: React.FC<Props> = ({Count, handleClickCorrectAnswer, handleClickWrongAnswer}) => {

    const [AnswerOptions, setAnswerOptions] = useState<number[]>([])
    const [OptionClicked, setOptionClicked] = useState<number|null>(null)

    useEffect(() => {
        const options = new Set<number>(); // Using a set to ensure uniqueness
        const range = 5; // The range within which to generate random numbers

        options.add(Count); // Add the correct answer first

        while (options.size < 5) {
            // Generate a random number within the range above or below the correctAnswer
            const randomOffset = Math.floor(Math.random() * (range * 2 + 1)) - range;
            const randomNumber = Count + randomOffset;

            // Ensure the random number is unique and not the same as correctAnswer
            if (!options.has(randomNumber)) {
                options.add(randomNumber);
            }
        }

        // Convert the set to an array and shuffle the elements
        // const shuffledOptions = Array.from(options).sort(() => Math.random() - 0.5);
        const shuffledOptions = Array.from(options).sort((a, b) => a - b);


        setAnswerOptions(shuffledOptions)
    }, [])

    return (
        <div
            className={`flex-col items-center justify-center mx-auto space-y-2 px-6`}>
            <div className="flex items-center justify-center text-white font-bold">What's the count?</div>
            <div className="flex flex-row justify-center items-center space-x-4 px-0">
                {
                    AnswerOptions.map((answer,index ) =>
                        <button
                            key={index}
                            className={`btn btn-sm items-center justify-center w-12 ${(OptionClicked == answer && OptionClicked != Count) ? 'animate-shake' : OptionClicked == answer ? 'btn-success text-white' : 'animate-none' }`}
                            onClick={() => {
                                setOptionClicked(answer)
                                setTimeout(() => {
                                    setOptionClicked(null)
                                    answer == Count ? handleClickCorrectAnswer() : handleClickWrongAnswer()
                                }, 500)
                            }}
                        >
                            {answer}
                        </button>)
                }
            </div>
        </div>
    )
}

export default CountQuiz