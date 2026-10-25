'use client';

import React from 'react';
import { TextViewerApp } from './TextViewerApp';

export function ResumeApp() {
  // Opens the official canonical Resume.txt in the document viewer matching Screenshot 2
  return <TextViewerApp initialFileId="d-resume-txt" />;
}
