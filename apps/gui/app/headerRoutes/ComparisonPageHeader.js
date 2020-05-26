import React from "react";
import api from "utils/api";
import routeBuilder from "utils/routeBuilder";
import ComparisonNameHeader from "../components/ComparisonNameHeader";
import Header from './Header';

const ComparisonPageHeader = props => (
  <React.Fragment>
    <Header
      {...props}
      item={<ComparisonNameHeader {...props} />}
      labelTag="navigation.stream_comparisons"
      buttons={[
        {
          labelTag: "buttons.go_back",
          icon: "keyboard backspace",
          onClick: () => {
            props.history.push(routeBuilder.comparison_list());
          }
        }
      ]}
    />
  </React.Fragment>
);

export default ComparisonPageHeader;
