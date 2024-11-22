export function validateUrl(url: string): boolean {
  const regex = new RegExp(
    '^' + // start of string
      '(?:(https?|ftp):\\/\\/)?' + // protocol (optional, but if present, must be http, https, or ftp)
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      'localhost|' + // localhost
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IPv4 address
      '(\\:\\d+)?' + // port (optional)
      '(\\/[-a-z\\d%_.~+]*)*' + // path (optional)
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string (optional)
      '(\\#[-a-z\\d_]*)?' + // fragment (optional)
      '$', // end of string
    'i',
  );
  return regex.test(url);
}
