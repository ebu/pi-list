export const extractFileFromResponse = (data: any) => {
    const disposition = data.headers['content-disposition'];
    let fileName = '';
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '');
    }
    const downloadUrl = window.URL.createObjectURL(new Blob([data.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
