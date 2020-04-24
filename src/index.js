import React, { Component } from "react";
import BackDrop from "./backDrop";
import PropTypes from "prop-types";
import styles from "./styles.scss";
import CloseIcon from "./assets/close.svg";

export const STATES = {
    OPEN: "OPEN",
    OPENING: "OPENING",
    HIDDEN: "HIDDEN",
    CLOSED: "CLOSED",
    CLOSING: "CLOSING",
};

const DFAULT_TIMEOUT = 700;

const updateDom = (flag) => {
    const html = document.getElementsByTagName("body")[0];
    if (flag) {
        html.classList.add(styles["scroll-lock"]);
    } else {
        html.classList.remove(styles["scroll-lock"]);
    }
};

const updateFocus = (el) => el && el.focus();

class RootComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            overlayState: STATES.HIDDEN,
            prevState: props.isOpen,
            initiator: null,
        };
        this.ref = React.createRef();
    }

    static getDerivedStateFromProps(props, state) {
        const { isOpen, configs: { animate } = {} } = props;
        const { prevState } = state;

        if (isOpen === prevState) {
            return null;
        }

        if (isOpen) {
            updateDom(true);
            return {
                overlayState: !animate ? STATES.OPEN : STATES.OPENING,
                prevState: isOpen,
                initiator: document.activeElement,
            };
        } else {
            return {
                overlayState: !animate ? STATES.CLOSED : STATES.CLOSING,
                prevState: isOpen,
            };
        }
    }

    keyPress = (event) => {
        const code = event.keyCode ? event.keyCode : event.which;

        // if the escape key is pressed
        if (code === 27) {
            const { isOpen, closeOverlay } = this.props;
            // const { overlayState } = this.state;
            if (isOpen) {
                closeOverlay();
            }
        }
    };

    componentDidUpdate() {
        const { animate } = this.props.configs || {};
        if (!animate) {
            return;
        }

        const { overlayState, initiator } = this.state;

        if (overlayState === STATES.OPENING) {
            const node = this.ref.current;
            updateFocus(node);
            setTimeout(() => {
                this.setState({
                    overlayState: STATES.OPEN,
                });
            }, DFAULT_TIMEOUT);
        } else if (overlayState === STATES.CLOSING) {
            updateFocus(initiator);
            updateDom(false);
            setTimeout(() => {
                this.setState({
                    overlayState: STATES.CLOSED,
                });
            }, DFAULT_TIMEOUT);
        }
    }

    render() {
        const { children, isOpen, closeOverlay, showCloseIcon = true, configs = {} } = this.props;
        const {
            animate,
            top,
            contentClass,
            clickDismiss = true,
            escapeDismiss = true,
            focusOutline = false,
        } = configs;
        const { overlayState } = this.state;

        const className = [
            styles["overlay-wrapper"],
            overlayState === STATES.HIDDEN ? styles["overlay-hidden"] : "",
            overlayState === STATES.OPEN ? styles["overlay-open"] : "",
            overlayState === STATES.OPENING ? styles["overlay-opening"] : "",
            overlayState === STATES.CLOSING ? styles["overlay-closing"] : "",
            overlayState === STATES.CLOSED ? styles["overlay-closed"] : "",
        ]
            .filter(Boolean)
            .join(" ");

        const attrs = {
            className,
            onKeyPress: escapeDismiss ? (e) => this.keyPress(e) : undefined,
            onKeyDown: escapeDismiss ? (e) => this.keyPress(e) : undefined,
        };

        const contentAttrs = {
            className: [
                showCloseIcon ? styles["overlay-content"] : "",
                focusOutline ? styles["with-outline"] : "",
                contentClass || "",
            ]
                .filter(Boolean)
                .join(" "),
            [focusOutline ? "tabIndex" : ""]: 0,
        };

        const style = {
            "--top": top,
        };

        return (
            <div {...attrs} style={style}>
                <BackDrop
                    overlayState={overlayState}
                    clickDismiss={clickDismiss}
                    closeOverlay={closeOverlay}
                >
                    <div ref={this.ref} {...contentAttrs}>
                        {closeOverlay && showCloseIcon ? (
                            <div
                                className={styles["overlay-close"]}
                                role="button"
                                onClick={closeOverlay}
                                dangerouslySetInnerHTML={{ __html: CloseIcon }}
                            />
                        ) : null}

                        {children}
                    </div>
                </BackDrop>
            </div>
        );
    }
}

RootComponent.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.any,
    configs: PropTypes.object,
    closeOverlay: PropTypes.func,
    showCloseIcon: PropTypes.bool,
};

export default RootComponent;