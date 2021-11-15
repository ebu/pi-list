const router = require('express').Router();
const HTTP_STATUS_CODE = require('../enums/httpStatusCode');
import logger from '../util/logger';
const {
    getPreferences,
    setPreferences
} = require('../controllers/user');
const {
    getUserId,
    checkIsReadOnly
} = require('../auth/middleware');

function countUnread(lastConsultedTs, newsFeed) {
    if (!lastConsultedTs) return Object.keys(newsFeed).length.toString();

    let count = 0;
    newsFeed.forEach(function (item) {
        if (item.timestamp > lastConsultedTs) count++;
    });

    return count;
}

router.get('/', async (req, res) => {
    const userId = getUserId(req);

    let userPreferences = null;
    try {
        userPreferences = await getPreferences(userId);
    } catch (err) {
        logger('/news').error('Failed to obtain the user preferences.');
        logger('/news').error(err);
        return;
    }

    if (userPreferences === null) {
        res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send();
        return;
    }

    const newsFeed = [{
            id: '233ef2dd-f930-4334-b296-ee0cd517a5b5',
            title: 'NVIDIA GeForce RTX 3000 Series Launches With Impressive Specs, Competitive Pricing',
            timestamp: 1599126787,
            url: 'https://www.phoronix.com/scan.php?page=news_item&px=NVIDIA-RTX-3000-Launch',
            summary: 'As widely expected amid a constant flow of rumors and leaks in recent weeks, NVIDIA just revealed their GeForce RTX 3000 "Ampere" series.',
        },
        {
            id: 'bce2bb00-5de5-46ea-b831-bfd64ca750fb',
            title: 'Qt 6.0 Now Under Feature Freeze',
            timestamp: 1599126784,
            url: 'https://www.phoronix.com/scan.php?page=news_item&px=Qt-6.0-Feature-Freeze',
            summary: 'The Qt Company has announced the feature freeze for the big Qt 6.0 toolkit milestone.',
        },
        {
            id: '536c9036-63e4-48fc-b2e4-8b7a710637cd',
            title: 'Intel Sapphire Rapids Target Added To LLVM/Clang 12.0',
            timestamp: 1599126783,
            url: 'https://www.phoronix.com/scan.php?page=news_item&px=Intel-Sapphire-Rapids-LLVM-12',
            summary: 'Intel developers engaging with upstream LLVM have been adding AMX support and other new features for next year\'s Xeon "Sapphire Rapids" while as of a few days ago in LLVM 12 Git is the actual enabling of -march=sapphirerapids support.',
        },
        {
            id: '536c9036-63e4-48fc-b2e4-8b7a710637cd',
            title: 'Intel Sapphire Rapids Target Added To LLVM/Clang 12.0 2',
            timestamp: 1599126790,
            url: 'https://www.phoronix.com/scan.php?page=news_item&px=Intel-Sapphire-Rapids-LLVM-12',
            summary: 'Intel developers engaging with upstream LLVM have been adding AMX support and other new features for next year\'s Xeon "Sapphire Rapids" while as of a few days ago in LLVM 12 Git is the actual enabling of -march=sapphirerapids support.',
        },
        {
            id: '536c9036-63e4-48fc-b2e4-8b7a710637ce',
            title: 'New news item',
            timestamp: 1599126890,
            url: 'https://www.phoronix.com/scan.php?page=news_item&px=Intel-Sapphire-Rapids-LLVM-12',
            summary: 'Intel developers engaging with upstream LLVM have been adding AMX support and other new features for next year\'s Xeon "Sapphire Rapids" while as of a few days ago in LLVM 12 Git is the actual enabling of -march=sapphirerapids support.',
        },
    ];

    const lastConsultedTs = userPreferences.news ? userPreferences.news.last_consulted_ts : null;
    const data = {
        unread: countUnread(lastConsultedTs, newsFeed),
        news: newsFeed,
    };

    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send(data);
});

router.post('/markread', checkIsReadOnly, (req, res) => {
    const {
        timestamp
    } = req.body;
    const userId = getUserId(req);

    getPreferences(userId)
        .then((userPreferences) => {
            userPreferences.news.last_consulted_ts = timestamp;

            setPreferences(userId, userPreferences)
                .then(function () {
                    res.status(HTTP_STATUS_CODE.SUCCESS.OK).send();
                    return;
                })
                .catch(function (err) {
                    logger('/news').error('Failed to mark the news feed as read.');
                    logger('/news').error(err);
                    res.status(HTTP_STATUS_CODE.SERVER_ERROR.INTERNAL_SERVER_ERROR).send();
                    return;
                });
        })
        .catch(function (err) {
            logger('/news').error('Failed to obtain the user preferences.');
            logger('/news').error(err);
            res.status(HTTP_STATUS_CODE.CLIENT_ERROR.NOT_FOUND).send();
            return;
        });
});

module.exports = router;