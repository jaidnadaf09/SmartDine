export const scrollToTop = () => {

  // scroll browser window
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth"
  });

  // scroll main content container
  const pageContent = document.querySelector(".page-content");

  if (pageContent) {
    pageContent.scrollTop = 0;
  }

  // fallback
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

};
