import React from 'react';
import PropTypes from 'prop-types';
import { useStateValue } from '../../utils/AppContext';
import api from '../../utils/api';

const NewsItem = ({ data }) => (
    <>
        <div>
            <b>{data.title}</b>
        </div>
        <div>
            <a href={data.url} target="_blank" rel="noopener noreferrer" style={{ color: 'white' }}>
                {data.url}
            </a>
        </div>
        <div>
            <i>{data.summary}</i>
        </div>
        <br />
        <br />
    </>
);

const NewsItemShape = PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
});

NewsItem.propTypes = {
    data: NewsItemShape.isRequired,
};

const News = () => {
    const [{ news }] = useStateValue();

    React.useEffect(
        () => {
            let latestTimestamp = 0;
            news.news.forEach(item => {
                if (item.timestamp > latestTimestamp) latestTimestamp = item.timestamp;
            });
            api.setNewsRead({ timestamp: latestTimestamp });
        },
        []
        // TODO: Set to 0 the number of unread news in the navbar.
    );

    return (
        <div>
            {news.news.map(obj => (
                <NewsItem key={obj.timestamp} data={obj} />
            ))}
        </div>
    );
};

export default News;
