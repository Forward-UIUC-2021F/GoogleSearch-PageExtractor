import React, { useState, useEffect } from 'react'
import styles from "../styles/splitScreen.css"
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import { TextField, Card, CardActions, CardContent, Button, Typography, Box, Popover, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import PopupState, { bindTrigger, bindPopover } from 'material-ui-popup-state';
import Chart from "react-google-charts";


//need to make this dynamic later
const sizeOfDashboard = 300

//todo make into an api
const labels = ["Education", "Biography", "Research Interest", "Award", "Other", "Publication", "Coursework", "Associated University", "Email", "Address", "Phone", "Name"]

const useStyles = makeStyles({
    root: {
        minWidth: 275,
        margin: '10px'
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    dashboardCard: {
        height: (sizeOfDashboard) + 'px',
        position: 'fixed',
        marginTop: (-1 * sizeOfDashboard) + 'px',
        // width: '80%',
        maxWidth: '475px',
        width: '100%',
        zIndex: '2',
        // margin: '5px',
        // minWidth: '45%',
        margin: '3px',
        overflowY: 'scroll',
    }
});


export default function RightPane(props) {


    // let metrics = {
    //     correct: 0,
    //     incorrect: 0,
    // }

    const [metrics, setMetrics] = useState({ accuracy: { correct: 0, incorrect: 0 }, classMetric: {} });


    const updateDashboard = (predicted, actual) => {

        //super inneeficient -> change to reducer???
        const oldMetrics = JSON.parse(JSON.stringify(metrics));

        if (predicted === actual) {
            oldMetrics.accuracy.correct++
        } else {
            oldMetrics.accuracy.incorrect++
        }

        const class_key = "classMetric"

        //update store for confusion matrix
        if (oldMetrics[class_key][actual] == undefined) {
            oldMetrics[class_key][actual] = {}
        }
        oldMetrics[class_key][actual][predicted] = (oldMetrics[class_key][actual][predicted] + 1) || 1;

        setMetrics(oldMetrics)
        // alert(metrics.accuracy.correct)
    }

    const displayScraped = (data, xpaths) => {
        let elems = []
        for (let i = 0; i < data.length; i++) {
            elems.push(
                <SimpleCard text={data[i][0]} label={data[i][1]} url={props.frameURL} updateDashboard={updateDashboard} xpath={xpaths[i]} highlight={props.highlight} />
            )
        }
        return elems
    }

    return (
        <div className={styles.pane} style={{ minWidth: '100%' }}>
            {/* <div style={{ position: 'fixed', marginLeft: '30px', marginTop: '-100px' }}>
                hi2
            </div> */}
            <Metrics metrics={metrics} />
            <div style={{ marginTop: (sizeOfDashboard) + 'px' }}>
                {displayScraped(props.conceptTerms, props.xpaths)}
            </div>
        </div>
    )
}

function Metrics(props) {
    const classes = useStyles();

    useEffect(() => {
        // effect
        // return () => {
        //     cleanup
        // }
    }, [props.metrics])

    function genChart(data) {
        return (
            <Chart
                width={'500px'}
                height={'300px'}
                chartType="BarChart"
                loader={<div>Loading Chart</div>}
                data={data}
                options={{
                    title: 'Label Innacuracy (True Label vs what Classifier Predicted)',
                    chartArea: { width: '50%' },
                    isStacked: true,
                    hAxis: {
                        title: 'Distribution',
                        minValue: 0,
                    },
                    vAxis: {
                        title: 'Labels',
                        min: 0,
                    },
                }}
                // For tests
                rootProps={{ 'data-testid': '3' }}
            />
        )
    }

    function prettifyMetrics(metrics) {

        // const data = [
            // ['City', '2010 Population', '2000 Population'],
            // ['New York City, NY', 30, 60],
            // ['Los Angeles, CA', 3792000, 3694000],
            // ['Chicago, IL', 2695000, 2896000],
            // ['Houston, TX', 2099000, 1953000],
            // ['Philadelphia, PA', 1526000, 1517000],
        // ]

        let cleaned = [
            ["Label", ...labels],
        ]

        console.log(metrics)
        for (const [key, labelMetrics] of Object.entries(metrics["classMetric"])) {
            //ok so format i need is [key, then the values in value]
            // console.log(key, labelMetrics)
            let extracted = []
            let sum = 0
            for (const label of labels) {
                // console.log(label, labelMetrics[label])
                let val = labelMetrics[label]
                if (val == undefined) {
                    val = 0;
                }
                extracted.push(val)
                sum += val
            }

            // ok so now convert to percentage
            extracted = extracted.map((val) => val/sum * 100)

            cleaned.push([key,...extracted])
        }

        console.log(cleaned) 

        return (
            <div>
                {genChart(cleaned)}
                {JSON.stringify(metrics["classMetric"])}
            </div>
        )
    }


    return (
        <Card className={classes.dashboardCard}>
            {/* 
            Need to display accuracy
            - accuracies for each label???
        */}
            <h3>Accuracy: {props.metrics.accuracy.correct / (props.metrics.accuracy.correct + props.metrics.accuracy.incorrect + .01) * 100}%</h3>
            <br></br>
            {prettifyMetrics(props.metrics)}
        </Card>
    )
}

function SimpleCard(props) {
    const classes = useStyles();

    return (
        <Card className={classes.root}>
            <CardContent>
                <LabelField classes={classes} text={props.text} url={props.url} label={props.label} xpath={props.xpath} updateDashboard={props.updateDashboard} />

                <Button variant="contained" color="primary" onClick={() => props.highlight(props.xpath)}>Highlight</Button>
                <Typography className={classes.title} color="" gutterBottom>
                    - {props.xpath}
                </Typography>

                <Typography className={classes.title} color="" gutterBottom>
                    {props.text}
                </Typography>
            </CardContent>

        </Card>
    );
}

function LabelField(props) {

    return (
        <Typography className={props.classes.pos} color="textSecondary">
            <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
            }}>
                {props.label}
                <PopoverPopupState text={props.text} label={props.label} url={props.url} xpath={props.xpath} updateDashboard={props.updateDashboard} />
            </div>

        </Typography >
    )
}

function PopoverPopupState(props) {

    const [disabled, setDisabled] = useState(false)
    const [verifyLabel, setVerifyLabel] = useState("Verify Label")
    return (
        <PopupState variant="popover" popupId="demo-popup-popover">
            {(popupState) => (
                <div>
                    <Button color="primary" {...bindTrigger(popupState)} disabled={disabled}>
                        {verifyLabel}
                    </Button>
                    <Popover
                        {...bindPopover(popupState)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'center',
                            horizontal: 'left',
                        }}
                    >
                        <Box p={2}>
                            <UpdateLabel text={props.text} url={props.url} label={props.label} xpath={props.xpath} updateDashboard={props.updateDashboard} verify={() => { setDisabled(true); setVerifyLabel("Verified") }} />
                        </Box>
                    </Popover>
                </div>
            )}
        </PopupState>
    );
}

function UpdateLabel(props) {
    const backendURL = "http://localhost:8000/api/"

    // sends new label to backend
    const update = (text, label, xpath, url) => {
        var data = JSON.stringify({"label": label, "text": text, xpath: xpath, url: url});
        var config = {
            method: 'post',
            url: 'http://localhost:8000/api/updateLabel',
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                // setRawHTML(response.data.rawHTML)
                // setConceptTerms(response.data.conceptTerms)
            })
            .catch(function (error) {
                console.log(error);
            });

    }

    const classes = useStyles();
    const [newLabel, setNewLabel] = React.useState('');
    const [open, setOpen] = React.useState(false);

    const handleChange = (event) => {
        setNewLabel(event.target.value);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <span>
            {/* <div>Current: <i>{props.label}</i></div>
            <br></br> */}
            {/* <div>
                Label: <br></br>
                <TextField id="standard-basic" label="Update" value={newLabel} onChange={(e) => { setNewLabel(e.target.value) }} />
            </div> */}
            <div>
                Original Label: {props.label}
            </div>
            <br></br>
            <FormControl className={classes.formControl}>
                <InputLabel id="demo-controlled-open-select-label">Label</InputLabel>
                <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    open={open}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    value={newLabel}
                    onChange={handleChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    {labels.map((val) => {
                        return <MenuItem value={val}>{val}</MenuItem>
                    })}
                </Select>

                <br></br>

                <Button variant="contained" color="primary" onClick={() => { update(props.text, props.label, props.xpath, props.url); props.updateDashboard(props.label, props.label); props.verify() }}>
                    Correct
                </Button>
                <br></br>
                <Button variant="contained" color="secondary" onClick={() => { update(props.text, newLabel, props.xpath, props.url); props.updateDashboard(props.label, newLabel); props.verify() }}>
                    Update
                </Button>
            </FormControl>

        </span>
    )
}