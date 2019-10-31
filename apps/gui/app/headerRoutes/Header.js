import React, { Fragment, Component } from "react";
import Button from "../components/common/Button";
import { T } from "../utils/translation";

const Header = props => (
  <Fragment>
    <h1 className="lst-no-margin">
      <div style={{ display: "flex" }}>
        <span className="lst-header-title">
          <T t={props.labelTag} />
        </span>
        <span>{props.item}</span>
      </div>
    </h1>
    <div className="col-xs end-xs">
      {props.children}
      {props.buttons &&
        props.buttons.map(button => {
          const buttonLabel = <T t={button.labelTag} />;

          return (
            <Button
              key={button.labelTag}
              className="lst-header-button"
              label={buttonLabel}
              type="info"
              icon={button.icon}
              outline
              noMargin
              noAnimation
              downloadPath={button.downloadPath}
              externalPath={button.externalPath}
              filename={button.filename}
              onClick={() => button.onClick()}
            />
          );
        })}
    </div>
  </Fragment>
);

export default Header;
