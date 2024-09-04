import React, {useEffect, useRef, useState} from 'react';
import {interpolate} from 'd3-interpolate';

interface SVGInterpolatorProps {
    filePaths: string[];
    duration?: number; // Duration of each transition in milliseconds
}

const SVGInterpolator: React.FC<SVGInterpolatorProps> = ({filePaths, duration = 50}) => {
    const [currentSVG, setCurrentSVG] = useState<string | null>(null);
    const [nextSVG, setNextSVG] = useState<string | null>(null);
    const [interpolatedElements, setInterpolatedElements] = useState<React.ReactNode[]>([]);
    const svgIndex = useRef(0);
    const transitionRef = useRef<number | null>(null);

    useEffect(() => {
        const fetchSVGContent = async (path: string) => {
            const response = await fetch(path);
            return await response.text();
        };

        const startTransition = async () => {
            const currentSVGContent = await fetchSVGContent(filePaths[svgIndex.current]);
            const nextSVGContent = await fetchSVGContent(filePaths[(svgIndex.current + 1) % filePaths.length]);

            setCurrentSVG(currentSVGContent);
            setNextSVG(nextSVGContent);

            const currentElements = extractElementsFromSVG(currentSVGContent);
            const nextElements = extractElementsFromSVG(nextSVGContent);

            const interpolators = currentElements.map((currentElement, index) => {
                const nextElement = nextElements[index] || {};
                return {
                    type: currentElement.type,
                    interpolate: interpolate(currentElement.attributes, nextElement.attributes || {}),
                };
            });

            let startTime: number | null = null;

            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;

                const elapsed = timestamp - startTime;
                const t = Math.min(1, elapsed / duration);

                const interpolated = interpolators.map(({type, interpolate}) => {
                    const attrs = interpolate(t);
                    return React.createElement(type, {...attrs});
                });

                setInterpolatedElements(interpolated);

                if (t < 1) {
                    transitionRef.current = requestAnimationFrame(animate);
                } else {
                    svgIndex.current = (svgIndex.current + 1) % filePaths.length;
                    startTransition();
                }
            };

            transitionRef.current = requestAnimationFrame(animate);
        };

        startTransition();

        return () => {
            if (transitionRef.current) {
                cancelAnimationFrame(transitionRef.current);
            }
        };
    }, [filePaths, duration]);

    const extractElementsFromSVG = (svgContent: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');
        const elements: any[] = [];

        doc.querySelectorAll('path, ellipse, rect, circle').forEach(element => {
            const attributes: { [key: string]: string } = {};
            Array.from(element.attributes).forEach(attr => {
                attributes[attr.name] = attr.value;
            });
            elements.push({type: element.tagName, attributes});
        });

        return elements;
    };


    return (
        <svg width="61"
             height="187"
             viewBox="0 0 90 187"
             fill="none"
             xmlns="http://www.w3.org/2000/svg">
            {interpolatedElements}
        </svg>
    );
};

export default SVGInterpolator;
