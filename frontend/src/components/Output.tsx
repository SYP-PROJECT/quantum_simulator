import React from 'react';

interface OutputComponentProps {
  output: string;
}

const OutputComponent: React.FC<OutputComponentProps> = ({ output }) => {
  return (
    <div className='output-container'>
      {output}
    </div>
  );
};

export default OutputComponent;
