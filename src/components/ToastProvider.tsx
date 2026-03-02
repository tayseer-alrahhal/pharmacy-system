"use client";

import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

export default function ToasterProvider() {
    return <GooeyToaster position="bottom-right" showProgress={true} />;
}
