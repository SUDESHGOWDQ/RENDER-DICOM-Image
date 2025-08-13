import React, { useEffect, useRef,  } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

// Configure cornerstoneWADOImageLoader
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

    // Register the file with cornerstoneWADOImageLoader
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(selectedFile);

    try {
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(elementRef.current, image);
    } catch (error) {
      console.error("Error loading image:", error);
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
