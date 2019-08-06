const fs = require('fs');
const phantom = require('phantom');

function generate (jsonReport) {
    return phantom.create().then(function (ctx) {
        return ctx.createPage().then(function (page) {

            page.property('paperSize', { format: 'A4', orientation: 'portrait', margin: '1cm' });
            return page.open('./util/report-template.html').then(function (stat) {

                /* ATTENTION: Inside the evaluate's callback, we're no longer in the NodeJS
                   context but inside a sandboxed browser environment. Any data we want to
                   pass in must go through as an argument to the callback, because it has to
                   be serialized before being available within that same context. */

                page.evaluate(function (report) {
                    // Set the analysis result
                    if (report.summary.error_list.length > 0) {
                        document.getElementById('result').innerHTML = 'FAILED';
                        document.getElementById('result').className += 'background-failed';
                    }
                    else if (report.summary.warning_list.length > 0) {
                        document.getElementById('result').innerHTML = 'PASSED WITH WARNINGS';
                        document.getElementById('result').className += 'background-warning';
                    }
                    else {
                        document.getElementById('result').innerHTML = 'PASSED';
                        document.getElementById('result').className += 'background-passed';
                    }

                    // Fill the metada
                    document.getElementById('file-name').innerHTML = report.file_name;
                    document.getElementById('date').innerHTML = (new Date()).toString();
                    document.getElementById('analysis-id').innerHTML = report.id;
                    document.getElementById('num-streams').innerHTML = report.streams.length.toString();

                    // Fill the stream analysis details
                    const streamAnalysisElem = document.getElementById('streams-analysis');
                    for (var i = 0; i < report.streams.length; ++i) {

                        const stream = report.streams[i];
                        var innerHTML = '<tr>';

                        const type = stream.media_type;
                        const result = stream.error_list.length == 0 ? 'Passed' : 'Failed';
                        const resultCssClass = result === 'Passed' ? 'foreground-passed' : 'foreground-failed';
                        innerHTML += '<td>' + type + '</td>';
                        innerHTML += '<td class="' + resultCssClass + '">' + result + '</td>';

                        if (stream.error_list.length > 0) {
                            innerHTML += '<td><ul>';
                            for (var j = 0; j < stream.error_list.length; ++j) {
                                const errorDesignation = stream.error_list[j];
                                innerHTML += '<li>' + errorDesignation['id'] + '</li>';

                            }
                            innerHTML += '</ul></td>';
                        }
                        else innerHTML += '<td></td>';

                        innerHTML += '</tr>';
                        document.getElementById('analysis').innerHTML += innerHTML;
                    }

                }, jsonReport);

                const reportName = jsonReport.file_name + '.pdf';
                return page.render(reportName).then(function () {
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
    generate
}
