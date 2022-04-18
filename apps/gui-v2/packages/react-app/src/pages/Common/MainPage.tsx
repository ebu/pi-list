import React from 'react';
import './styles.scss';
import { useNavigate } from 'react-router-dom';
import SidebarHOC from './SidebarHOC';
// import 'components/stories/styles.scss';
import routes from '../../routes';
import list from '../../utils/api';
import useRecoilPcapsHandler from '../../store/gui/pcaps/useRecoilPcapsHandler';
import useRecoilUserHandler from '../../store/gui/user/useRecoilUserHandler';
import useRecoilAnalysisProfileHandler from '../../store/gui/analysisProfile/useRecoilAnalysisProfileHandler';
import { ToastContainer } from 'react-toastify';

const MainPage  = () => {
    useRecoilUserHandler();

    useRecoilPcapsHandler();

    useRecoilAnalysisProfileHandler();

    const navigate = useNavigate();
    const [gdprConsent, setGdprConsent] = React.useState<boolean>();

    React.useEffect(() => {
        const f = async (): Promise<void> => {
            try {
                await list.info.getVersion();
            } catch {
                navigate('/login');
            }
        };
        f();
    }, [navigate]);

    React.useEffect(() => {
        const gdprConsentLocalStorage = localStorage.getItem('gdprConsent');
        if (gdprConsentLocalStorage) {
            setGdprConsent(gdprConsentLocalStorage === 'true' ? true : false);
        }
    }, []);

    return (
        <div className="main-page-container">
            <div className="main-page-left-sidebar">
                <div className="blend-div" />
                <SidebarHOC />
            </div>
            {routes}
            {gdprConsent ? <iframe className="iframe-news-all-pages" src="https://list.ebu.io/news/"></iframe> : null}
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                progressClassName="toastProgress"
                bodyClassName="toastBody"
            />
        </div>
    );
};

export default MainPage;
