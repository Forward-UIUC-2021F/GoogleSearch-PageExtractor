import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { Theme } from "@material-ui/core/styles/createMuiTheme";
import withStyles, {
  WithStyles,
  StyleRules
} from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";

import LeftPane from "./LeftPane"
import RightPane from "./RightPane"

const styles = (theme: Theme): StyleRules =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2),
      "max-height": "100vh",
      "min-height": "100vh"
    }
  });

interface Props extends WithStyles<typeof styles> {}

class SimplePaper extends React.Component<Props> {
  public render() {
    const { classes } = this.props;

    return (
      <div>
        <Paper className={classes.root} square={true}>
          <Typography variant="h5" component="h3">
            {this.props}
          </Typography>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(SimplePaper);
