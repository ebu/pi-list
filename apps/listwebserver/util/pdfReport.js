const fs = require('fs');
const phantom = require('phantom');
const analysis = require('../enums/analysis');

function generate(jsonReport) {
    return phantom.create().then(function(ctx) {
        return ctx.createPage().then(function(page) {
            page.property('paperSize', {
                format: 'A4',
                orientation: 'portrait',
                margin: '1cm',
            });
            return page.open('./util/reportTemplate.html').then(function(stat) {
                /* ATTENTION: Inside the evaluate's callback, we're no longer in the NodeJS
                   context but inside a sandboxed browser environment. Any data we want to
                   pass in must go through as an argument to the callback, because it has to
                   be serialized before being available within that same context. */

                page.evaluate(
                    function(report, analysis) {
                        // Fill the metada
                        document.getElementById('file-name').innerHTML =
                            report.file_name;
                        document.getElementById(
                            'date'
                        ).innerHTML = new Date().toString();
                        document.getElementById('analysis-id').innerHTML =
                            report.id;
                        document.getElementById(
                            'num-streams'
                        ).innerHTML = report.streams.length.toString();

                        // Fill the stream analysis details
                        var numErrors = 0,
                            numWarnings = 0;
                        for (var i = 0; i < report.streams.length; ++i) {
                            const stream = report.streams[i];
                            var innerHTML = '<tr>';

                            const mediaType = stream.media_type;

                            if (stream.error_list.length > 0) {
                                ++numErrors;
                                innerHTML += '<td>' + mediaType + '</td>';
                                innerHTML += '<td class="foreground-failed">Failed</td>';
                                innerHTML += '<td><ul>';
                                for (
                                    var j = 0;
                                    j < stream.error_list.length;
                                    ++j
                                ) {
                                    const errorDesignation =
                                        stream.error_list[j];
                                    innerHTML +=
                                        '<li>' +
                                        errorDesignation['id'] +
                                        '</li>';
                                }
                                innerHTML += '</ul></td>';
                            } else if (mediaType.toLowerCase() === 'unknown') {
                                ++numWarnings;
                                innerHTML += '<td>' + mediaType + '</td>';
                                innerHTML += '<td class="foreground-warning">Warning</td>';
                                innerHTML += '<td>Unknown media type</td>';
                            } else {
                                innerHTML += '<td>' + mediaType + '</td>';
                                innerHTML += '<td class="foreground-passed">Passed</td>';
                                innerHTML += '<td></td>';
                            }

                            innerHTML += '</tr>';
                            document.getElementById(
                                'analysis'
                            ).innerHTML += innerHTML;
                        }

                        // Set the analysis result
                        if (numErrors > 0) {
                            document.getElementById('result').innerHTML =
                                'FAILED';
                            document.getElementById('result').className +=
                                'background-failed';
                            document.getElementById('errors').className =
                                'show-row';
                            document.getElementById(
                                'num-errors'
                            ).innerHTML = numErrors.toString();
                            if (numWarnings > 0) {
                                document.getElementById('warnings').className =
                                    'show-row';
                                document.getElementById(
                                    'num-warnings'
                                ).innerHTML = numWarnings.toString();
                            }
                        } else if (numWarnings > 0) {
                            document.getElementById('result').innerHTML =
                                'PASSED WITH WARNINGS';
                            document.getElementById('result').className +=
                                'background-warning';
                            document.getElementById('warnings').className =
                                'show-row';
                            document.getElementById(
                                'num-warnings'
                            ).innerHTML = numWarnings.toString();
                        } else if (report.summary.warning_list.length > 0) {
                            document.getElementById('result').innerHTML =
                                'PASSED WITH WARNINGS';
                            document.getElementById('result').className +=
                                'background-warning';
                            const warningsList = report.summary.warning_list;

                            for (var w = 0; w < warningsList.length; ++w) {
                                if (
                                    warningsList[w].stream_id == null &&
                                    warningsList[w].value.id ===
                                        analysis.warnings.pcap.truncated
                                ) {
                                    document.getElementById(
                                        'file-name'
                                    ).innerHTML += ' (truncated)';
                                    document.getElementById(
                                        'file-name'
                                    ).className += 'foreground-warning';
                                    break;
                                }
                            }
                        } else {
                            document.getElementById('result').innerHTML =
                                'PASSED';
                            document.getElementById('result').className +=
                                'background-passed';
                        }
                    },
                    jsonReport,
                    analysis
                );

                const reportName = jsonReport.file_name + '.pdf';
                return page.render(reportName).then(function() {
                    const report = fs.readFileSync(reportName);
                    fs.unlinkSync(reportName);

                    ctx.exit();
                    return report;
                });
            });
        });
    });
}

module.exports = {
    generate,
};
