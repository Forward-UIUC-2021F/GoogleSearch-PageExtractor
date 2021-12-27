import { React, useEffect, useState } from 'react'
import styles from "../styles/splitScreen.css"

export default function LeftPane(props) {



    // const iframe = <iframe srcDoc={props.rawHTML} style={{height: '100vh', minWidth: '100%'}}/>
    const [highlights, setHighlights] = useState("")

    const highlightText = (xpath) => {
        let doc = new DOMParser().parseFromString(props.rawHTML, 'text/html');
        let xpathNode = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

        const sHtml = `<script>
                var elmnt = document.getElementById("highlighted");
                // elmnt.scrollTop -= 100;
                elmnt.scrollIntoView();
            </script>
        `;
        const frag = document.createRange().createContextualFragment(sHtml)
        doc.body.appendChild(frag);

        try {
            const highlightedNode = xpathNode.singleNodeValue.innerHTML;
            xpathNode.singleNodeValue.innerHTML =
                `
                    <span id="highlighted" style="background-color: #FFFF00"'>
                    ${highlightedNode}
                    </span>
                `;
            setHighlights(doc.documentElement.innerHTML)
        } catch {
            alert("Can't find element")
        }

    }

    useEffect(() => {
        setHighlights(props.rawHTML)
        props.setHighlightFunc(() => (xpath) => highlightText(xpath))
    }, [props.rawHTML])


    return (
        <div className={styles.pane} style={{ height: '92vh', minWidth: '100%' }}>
            {/* {
                iframe
            } */}
            {/* <div dangerouslySetInnerHTML={{__html: doc.body.outerHTML}} /> */}
            <iframe srcDoc={highlights} style={{ height: '100vh', minWidth: '100%' }} />
        </div>
    )
}