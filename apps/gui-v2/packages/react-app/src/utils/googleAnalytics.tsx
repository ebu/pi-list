interface IComponentProps {
    gdprConsent: boolean | undefined;
    pathName?: string;
}

export const GoogleAnalyticsHandler = ({ gdprConsent, pathName }: IComponentProps) => {
    if (!gdprConsent) {
        return null;
    }

    import('react-ga').then(ReactGA => {
        ReactGA.initialize('UA-183941332-1');

        if (pathName) {
            ReactGA.pageview(pathName);
        }
    });

    return null;
};
