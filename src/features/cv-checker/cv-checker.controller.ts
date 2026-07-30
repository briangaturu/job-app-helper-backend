import type { Request, Response } from "express";
import pdfParse from "pdf-parse";
import { analyzeCVForATS } from "./cv-checker.service.js";

export async function checkCV(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    let cvText: string;

    // Extract text based on file type
    if (req.file.mimetype === "application/pdf") {
      const pdfData = await (pdfParse as any)(req.file.buffer);
      cvText = pdfData.text;
    } else if (req.file.mimetype === "text/plain") {
      cvText = req.file.buffer.toString("utf-8");
    } else {
      return res.status(400).json({ 
        message: "Unsupported file type. Please upload PDF or TXT file." 
      });
    }

    if (!cvText || cvText.trim().length < 100) {
      return res.status(400).json({ 
        message: "Could not extract sufficient text from the file. Please ensure the PDF is not scanned/image-based." 
      });
    }

    // Analyze CV for ATS compatibility
    const analysis = await analyzeCVForATS(cvText);

    res.status(200).json({
      fileName: req.file.originalname,
      fileSize: req.file.size,
      analysis,
    });
  } catch (error) {
    console.error("CV analysis error:", error);
    res.status(500).json({ 
      message: "Failed to analyze CV. Please try again." 
    });
  }
}
