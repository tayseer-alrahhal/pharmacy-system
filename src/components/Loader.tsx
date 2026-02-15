import React from 'react'

export default function Loader() {
    return (
        <div className="flex items-center justify-center">
            <div className="w-16 h-12">
                <svg viewBox="0 0 64 48" className="w-full h-full">

                    {/* Back line */}
                    <polyline
                        points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                        className="fill-none stroke-[3] stroke-(--color-primary)/30"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Front animated line */}
                    <polyline
                        points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                        className="fill-none stroke-[3] stroke-(--color-primary) animate-dash"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            strokeDasharray: "48 144",
                            strokeDashoffset: 192,
                        }}
                    />
                </svg>
            </div>
        </div>

    )
}