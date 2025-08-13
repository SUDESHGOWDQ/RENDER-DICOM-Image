import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dcmjs from "dcmjs";
import dicomParser from "dicom-parser";

// Configure cornerstoneWADOImageLoader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

export default function DicomViewer() {
  const elementRef = useRef(null);
  const [dicomInfo, setDicomInfo] = useState(null);

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

    // Read file as ArrayBuffer for metadata extraction
    const arrayBuffer = await selectedFile.arrayBuffer();
    let dicomDict, dataset, info;
    try {
      const dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      dicomDict = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomData.dict);
      dataset = { ...dicomDict, ...dicomData.meta }; // Merge meta and main dataset
      // Extract required fields
      info = {
        TransferSyntax: dataset.TransferSyntaxUID || '',
        SOPClassUID: dataset.SOPClassUID || '',
        SOPInstanceUID: dataset.SOPInstanceUID || '',
        Rows: dataset.Rows || '',
        Columns: dataset.Columns || '',
        Spacing: (dataset.PixelSpacing ? dataset.PixelSpacing.join("\\") : '') + (dataset.SliceThickness ? `\\${dataset.SliceThickness}` : ''),
        Direction: dataset.ImageOrientationPatient ? dataset.ImageOrientationPatient.join(',') : '',
        Origin: dataset.ImagePositionPatient ? dataset.ImagePositionPatient.join(',') : '',
        Modality: dataset.Modality || '',
        PixelRepresentation: dataset.PixelRepresentation || '',
        BitsAllocated: dataset.BitsAllocated || '',
        BitsStored: dataset.BitsStored || '',
        HighBit: dataset.HighBit || '',
        PhotometricInterpretation: dataset.PhotometricInterpretation || '',
        WindowWidth: dataset.WindowWidth || '',
        WindowCenter: dataset.WindowCenter || '',
      };
      setDicomInfo(info);
    } catch (e) {
      setDicomInfo({ error: 'Failed to parse DICOM file.' });
      return;
    }

    // Register the file with cornerstoneWADOImageLoader for image display
    const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(selectedFile);
    try {
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(elementRef.current, image);
    } catch (error) {
      console.error("Error loading image:", error);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px' }}>
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
      <div style={{ minWidth: '320px', fontFamily: 'monospace', fontSize: '14px', background: '#f7f7f7', padding: '16px', borderRadius: '8px' }}>
        <h3>DICOM Info</h3>
        {dicomInfo ? (
          dicomInfo.error ? (
            <div style={{ color: 'red' }}>{dicomInfo.error}</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {Object.entries(dicomInfo).map(([key, value]) => (
                <li key={key}><strong>{key}:</strong> {value}</li>
              ))}
            </ul>
          )
        ) : (
          <div style={{ color: '#888' }}>No DICOM file loaded.</div>
        )}
      </div>
    </div>
  );
}
