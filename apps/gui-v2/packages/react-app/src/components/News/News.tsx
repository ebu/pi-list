import React from 'react';
import './styles.scss';

interface IComponentProps {
    gdprConsent: boolean | undefined;
    onGDPRClick: (gdpr: boolean) => void;
}

function News({ gdprConsent, onGDPRClick }: IComponentProps) {
    return (
        <div className="news-page-container">
            <span className="login-page-title news-title">NEWS</span>
            {gdprConsent ? null : (
                <span className="news-privacy-overview-google">
                    We'd like to set Google Analytics cookies to help us to improve EBU LIST by collecting and reporting
                    information on how you use it. The cookies collect information in a way that does not directly
                    identify anyone. Read Google's overview of privacy and safeguarding data:
                    <a
                        href="https://support.google.com/analytics/answer/6004245"
                        target="_blank"
                        className="news-privacy-notice-pdf"
                    >
                        {' '}
                        Privacy overview
                    </a>
                    . If you decide not to opt into receiving cookies the News feature of EBU LIST will not be
                    available.
                </span>
            )}
            {gdprConsent ? <iframe className="iframe-news" src="https://list.ebu.io/news/"></iframe> : null}
            <div className="settings-page-accept-gdpr-container">
                {!gdprConsent ? (
                    <a className="news-privacy-notice-accept" onClick={() => onGDPRClick(true)}>
                        Accept
                    </a>
                ) : null}
                {gdprConsent === null || typeof gdprConsent === 'undefined' ? (
                    <a className="news-privacy-notice-decline" onClick={() => onGDPRClick(false)}>
                        Decline
                    </a>
                ) : null}
            </div>
            <a
                href="https://list.ebu.io/news/EBU-Privacy_Notice.pdf"
                target="_blank"
                className="news-privacy-notice-pdf"
            >
                EBU List Privacy Notice
            </a>
        </div>
    );
}

export default News;
