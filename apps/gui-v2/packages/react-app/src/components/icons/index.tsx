import React from 'react';

const makeIcon = (src: string) => ({ className, onClick }: { className?: string, onClick?: any }) => <img src={src} className={className} onClick={onClick} />;

const icon = (iconScr: any) => {
    return makeIcon(iconScr.default === undefined ? iconScr : iconScr.default);
};

const logoSrc = require('./logo.png');
export const LogoIcon = icon(logoSrc);

const arrowCollapsedSrc = require('./arrowCollapsed.svg');
export const ArrowCollapsedIcon = icon(arrowCollapsedSrc);

const arrowExpandedSrc = require('./arrowExpanded.svg');
export const ArrowExpandedIcon = icon(arrowExpandedSrc);

const comparisonIconSrc = require('./comparison.svg');
export const ComparisonIcon = icon(comparisonIconSrc);

const recordIconSrc = require('./record-rec.svg');
export const RecordIcon = icon(recordIconSrc);

const downloadManagerIconSrc = require('./downloadManager.svg');
export const DownloadManagerIcon = icon(downloadManagerIconSrc);

const analysisIconSrc = require('./analysis.svg');
export const AnalysisIcon = icon(analysisIconSrc);

const calendarIconSrc = require('./calendar.svg');
export const CalendarIcon = icon(calendarIconSrc);

const shortcutsIconSrc = require('./shortcuts.svg');
export const ShortcutsIcon = icon(shortcutsIconSrc);

const leftArrowIconSrc = require('./leftArrow.svg');
export const LeftArrowIcon = icon(leftArrowIconSrc);

const creditsIconSrc = require('./credits.svg');
export const CreditsIcon = icon(creditsIconSrc);

const helpIconSrc = require('./help.svg');
export const HelpIcon = icon(helpIconSrc);

const dashboardTableViewIconSrc = require('./dashboardTableViewIconSrc.svg');
export const DashboardTableViewIcon = icon(dashboardTableViewIconSrc);

const dashboardTilesViewIcon = require('./dashboardTilesViewIcon.svg');
export const DashboardTilesViewIcon = icon(dashboardTilesViewIcon);

const dashboardHybridViewIconSrc = require('./dashboardHybridViewIcon.svg');
export const DashboardHybridViewIcon = icon(dashboardHybridViewIconSrc);

const configIconSrc = require('./config.svg');
export const ConfigIcon = icon(configIconSrc);

const videoIconSrc = require('./video.svg');
export const VideoIcon = icon(videoIconSrc);

const binIconSrc = require('./bin.svg');
export const BinIcon = icon(binIconSrc);

const downloadIconSrc = require('./download.svg');
export const DownloadIcon = icon(downloadIconSrc);

const zoomInIconSrc = require('./zoomIn.svg');
export const ZoomInIcon = icon(zoomInIconSrc);

const zoomOutIconSrc = require('./zoomOut.svg');
export const ZoomOutIcon = icon(zoomOutIconSrc);

const volumeUpIconSrc = require('./volumeUp.svg');
export const VolumeUpIcon = icon(volumeUpIconSrc);

const volumeDownIconSrc = require('./volumeDown.svg');
export const VolumeDownIcon = icon(volumeDownIconSrc);

const playIconSrc = require('./play.svg');
export const PlayIcon = icon(playIconSrc);

const pauseIconSrc = require('./pause.svg');
export const PauseIcon = icon(pauseIconSrc);

const settingsIconSrc = require('./settings.svg');
export const SettingsIcon = icon(settingsIconSrc);

const settingsMiniIconSrc = require('./settings-mini.svg');
export const SettingsMiniIcon = icon(settingsMiniIconSrc);

const collapseIconSrc = require('./collapse.svg');
export const CollapseIcon = icon(collapseIconSrc);

const ebuListLogoSrc = require('./ebu_list_logo.png');
export const EbuListLogoIcon = icon(ebuListLogoSrc);

const transitDelaySrc = require('./transitDelay.svg');
export const TransitDelayIcon = icon(transitDelaySrc);

const avSyncSrc = require('./avSync.svg');
export const AvSyncIcon = icon(avSyncSrc);

const diffTransitDelaySrc = require('./diffTransitDelay.svg');
export const DiffTransitDelayIcon = icon(diffTransitDelaySrc);

const networkRedundancySrc = require('./networkRedundancy.svg');
export const NetworkRedundancyIcon = icon(networkRedundancySrc);

const alertSrc = require('./alert.svg');
export const AlertIcon = icon(alertSrc);

const plusSrc = require('./plus.svg');
export const PlusIcon = icon(plusSrc);

const minusSrc = require('./minus.svg');
export const MinusIcon = icon(minusSrc);

const editSrc = require('./pencil.svg');
export const EditIcon = icon(editSrc);

const searchSrc = require('./search.svg');
export const SearchIcon = icon(searchSrc);

const cancelSrc = require('./cancel.svg');
export const CancelIcon = icon(cancelSrc);
