## Live Demo === https://krisudicom.netlify.app/

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc]
-
(https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.






#### import React, { useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Configure cornerstone WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

export default function DicomViewer() {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    cornerstone.enable(element);

    return () => {
      cornerstone.disable(element);
    };
  }, []);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    try {
      // Register file with cornerstoneWADOImageLoader
      const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(selectedFile);

      // Load and display the image
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(elementRef.current, image);
    } catch (error) {
      console.error("Error loading DICOM image:", error);
    }
  };

  return (
    <div>
      <input type="file" accept=".dcm" onChange={handleFileChange} />
      <div
        ref={elementRef}
        style={{
          width: "512px",
          height: "512px",
          backgroundColor: "black",
          marginTop: "10px",
        }}
      />
    </div>
  );
}
