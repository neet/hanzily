import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
/* http://meyerweb.com/eric/tools/css/reset/
   v2.0 | 20110126
   License: none (public domain)
*/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
	display: block;
}
body {
	line-height: 1;
}
ol, ul {
	list-style: none;
}
blockquote, q {
	quotes: none;
}
blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}
table {
	border-collapse: collapse;
	border-spacing: 0;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #F9F9F9;
  --fg-primary: #3B3B3B;
  --fg-secondary: #7A7A7A;
  --border: #BABABA;
  --highlight: #0076FF;

  --green-light: #c4f0c5;
  --green-dark: #76b39d;
  --grey-light: #f1f1f1;
  --grey-dark: #eeeeee;
}

body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-feature-settings: 'kern';
  background-size: cover;
  background-attachment: fixed;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  text-rendering: optimizelegibility;
  text-size-adjust: none;
}
`;
