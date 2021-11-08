import React from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/scss/image-gallery.scss';
import './styles.scss';

interface IImage {
    original: string;
    thumbnail: string;
}

function ImagesGallery({
    imagesData,
    initFrameIndex,
    onChange,
}: {
    imagesData: Array<IImage>;
    initFrameIndex: number;
    onChange: (index: number) => void;
}) {
    const renderRightNav = (onClick: any, disabled: any) => {
        return (
            <button
                className="image-gallery-icon image-gallery-right-nav image-gallery-custom-right-nav"
                disabled={disabled}
                onClick={onClick}
            >
                <div className="image-gallery-nav-icon-container">
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 11L6 6L1 1" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
        );
    };

    const renderLeftNav = (onClick: any, disabled: any) => {
        return (
            <button
                className="image-gallery-icon image-gallery-left-nav image-gallery-custom-left-nav"
                disabled={disabled}
                onClick={onClick}
            >
                <div className="image-gallery-nav-icon-container">
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 1L1 6L6 11" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                </div>
            </button>
        );
    };

    return (
        <div className="image-gallery-container">
            <div className="image-gallery-div">
                <ImageGallery
                    items={imagesData}
                    showBullets={true}
                    showPlayButton={false}
                    showFullscreenButton={false}
                    startIndex={initFrameIndex}
                    renderRightNav={renderRightNav}
                    renderLeftNav={renderLeftNav}
                    onSlide={onChange}
                    lazyLoad={true}
                    showIndex={true}
                />
            </div>
        </div>
    );
}

export default ImagesGallery;
