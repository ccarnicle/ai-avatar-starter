import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';
import { useState, useEffect } from 'react';

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


const Home = () => {

  // Don't retry more than 20 times
  const maxRetries = 20;
  // Numbers of retries 
  const [retry, setRetry] = useState(0);
  // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);

  const [input, setInput] = useState('');
  const [img, setImg] = useState(''); 

  const [isGenerating, setIsGenerating] = useState(false);

  const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = (event) => {
    setInput(event.target.value);
  };

  const generateAction = async () => {
    console.log('Generating...');

     // Set loading has started
    setIsGenerating(true);

    // If this is a retry request, take away retryCount
    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });

      setRetry(0);
    }

    const finalInput = input.replace('CJ', 'cjcarnicle');

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input:finalInput }),
    });
    
    const data = await response.json();
  
    if (response.status === 503) {
      setRetry(data.estimated_time);
      console.log('Model still loading...');
      return;
    }
  
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      setIsGenerating(false);
      return;
    }
  

    //console.log(data.image)
    setFinalPrompt(input);
    setInput('');
    // Set image data into state property
    setImg(data.image);
    setIsGenerating(false);
  }

  // Add useEffect here
  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
        setRetryCount(maxRetries);
        return;
        }

      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>CJs AI Avatar Generator</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Paint me like one of your french girls</h1>
          </div>
          <div className="header-subtitle">
            <h2>Turn me into anyone you want! Make sure you refer to me as "CJ" in the prompt</h2>
          </div>
          <div className="prompt-container">
            <input className="prompt-box" value={input} onChange={onChange}/>
            <div className="prompt-buttons">
              <a
                className={
                  isGenerating ? 'generate-button loading' : 'generate-button'
                }
                onClick={generateAction}
              >
                {/* Tweak to show a loading indicator */}
                <div className="generate">
                  {isGenerating ? (
                    <span className="loader"></span>
                  ) : (
                    <p>Generate</p>
                  )}
                </div>
              </a>
            </div>
          </div>
        </div>
        {img && (
          <div className="output-content">
            <Image src={img} width={512} height={512} alt={finalPrompt} />
            {/* Add prompt here */}
            <p>{finalPrompt}</p>
          </div>
        )}  
      </div>
      <div className="badge-container grow">
        <a
          href="https://buildspace.so/builds/ai-avatar"
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <Image src={buildspaceLogo} alt="buildspace logo" />
            <p>build with buildspace</p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
