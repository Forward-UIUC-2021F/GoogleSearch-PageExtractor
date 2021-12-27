import React, { useState } from 'react';
import { Button, TextField, Link } from '@material-ui/core';
import SplitPane, { Pane } from 'react-split-pane';
import SimplePaper from "./paper.tsx"
import LeftPane from './LeftPane';
import RightPane from './RightPane';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';

import Cookies from 'js-cookie';
import axios from 'axios';

let csrftoken = null;
const backendURL = "http://localhost:8000/api/"

async function getCsrfToken() {
    if (csrftoken === null) {
        const response = await fetch(`${backendURL}/csrf/`, {
            credentials: 'include',
        });
        const data = await response.json();
        csrftoken = data.csrfToken;
    }
    return csrftoken;
}

function search() {

}


export default function Home() {

    const [rawHTML, setRawHTML] = useState("")
    const [conceptTerms, setConceptTerms] = useState([])
    const [xpaths, setXpaths] = useState([])
    const [frameURL, setFrameURL] = useState("https://waf.cs.illinois.edu/");
    const [textURL, setTextURL] = useState("https://waf.cs.illinois.edu/");

    const [highlightXPATH, setHighlightFunc] = useState(() => () => ""); //default value a function that calls a function

    const [classifier, setClassifier] = useState(1)

    const updatePanes = (url, classifier) => {


        var data = JSON.stringify({ "url": url, classifier: classifier });

        var config = {
            method: 'post',
            url: 'http://localhost:8000/api/getWebsite',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                // console.log(JSON.stringify(response.data));
                setRawHTML(response.data.rawHTML)
                setConceptTerms(response.data.conceptTerms)
                setXpaths(response.data.xpaths)
            })
            .catch(function (error) {
                console.log(error);
            });


        setFrameURL(frameURL)
    }

    return (
        <div style={{ marginTop: '', justify: 'left', height: '100vh' }}>
            <center>
                <div>
                    <TextField style={{ width: '85%' }} id="standard-basic" shrink={false} value={textURL} onChange={(e) => { setTextURL(e.target.value) }} />
                    <Button variant="contained" onClick={() => { updatePanes(textURL, classifier); }}>Go</Button>
                    {' '}
                    <FormControl variant="filled">
                        <InputLabel htmlFor="filled-age-native-simple">Model</InputLabel>
                        <Select
                            native
                            value={classifier}
                            onChange={(event) => setClassifier(event.target.value)}
                        >
                            <option value={0}>RF TF-IDF</option>
                            <option value={1}>SVM Spacy</option>
                            <option value={2}>SVM TF-IDF</option>
                            <option value={3}>SVM RBF TF-IDF</option>
                        </Select>
                    </FormControl>
                </div>

                <a target="_blank" href="https://docs.google.com/document/d/1yAes3hF7WPDv2Y3SzAB_KHFZC7mtggTX6HMZhZMEhuM/edit?usp=sharing">Labeling Guidlines</a>
            </center>

            <SplitPane split="vertical" minSize={200} defaultSize={1200} maxSize={400} pane2Style={{ overflowY: 'auto' }}>
                {/* src: https://codesandbox.io/s/wr0gf?file=/src/App.tsx */}
                <div>
                    <LeftPane frameURL={frameURL} rawHTML={rawHTML} setHighlightFunc={setHighlightFunc} />
                </div>
                <div>
                    <RightPane frameURL={frameURL} conceptTerms={conceptTerms} xpaths={xpaths} highlight={highlightXPATH} />
                </div>
            </SplitPane>


        </div>

    )

}