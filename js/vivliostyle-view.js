// vivliostyle-view.js

// URL parameter "?viewer="
const ViewerMode = {
  NotUseVivliostyle: "0",
  VivliostyleWithDataUrlInIFrame: "1",
  VivliostyleNormalInIFrame: "2",
  RedirectToVivliostyleViewer: "3",
};

const thisScriptFilePath = "js/vivliostyle-view.js";

function makeVivliostyleView() {
  const urlParams = new URLSearchParams(location.search);
  const viewerMode = urlParams.get("viewer") || ViewerMode.VivliostyleNormalInIFrame;
  if (viewerMode === ViewerMode.NotUseVivliostyle) {
    return;
  }
  const thisScriptTag = document.querySelector(`script[src$="${thisScriptFilePath}"]`);
  const prefix = thisScriptTag.src.slice(0, -thisScriptFilePath.length);
  const srcDocURL = location.origin + location.pathname;
  const hasTOC = !!document.querySelector("[role=doc-toc], .toc, #toc");
  let docURL = srcDocURL;

  if (viewerMode === ViewerMode.VivliostyleWithDataUrlInIFrame) {
    for (const styleLinkElem of document.querySelectorAll("link[rel~=stylesheet]")) {
      styleLinkElem.setAttribute("href", styleLinkElem.href);
    }
    for (const imgElem of document.querySelectorAll("img")) {
      imgElem.setAttribute("src", imgElem.src);
    }
    for (const anchorElem of document.querySelectorAll("a[href]")) {
      anchorElem.setAttribute("href", anchorElem.href);
    }
    docURL = "data:text/html," + encodeURIComponent(document.documentElement.outerHTML);
  }

  const bookMode = hasTOC && viewerMode !== ViewerMode.VivliostyleWithDataUrlInIFrame;
  const vivliostyleViewerUrlWithParams = `${prefix}js/viewer/index.html#src=${docURL}&bookMode=${bookMode}`;

  if (viewerMode === ViewerMode.RedirectToVivliostyleViewer) {
    location.replace(vivliostyleViewerUrlWithParams);
  } else if (window.parent !== window) {
    // Prevent iframe nesting if already in iframe
    window.parent.location.replace(location.href);
  } else {
    document.documentElement.innerHTML = `<head><title>${document.title}</title></head>
    <body style="margin:0;overflow:hidden">
    <iframe style="width:100vw;height:100vh;border:none" src="${vivliostyleViewerUrlWithParams}"></iframe>
    </body>`;
  
    setTimeout(function () {
      if (!document.querySelector("iframe")?.contentDocument) {
        if (viewerMode === ViewerMode.VivliostyleNormalInIFrame) {
          location.replace(srcDocURL + "?viewer=" + ViewerMode.VivliostyleWithDataUrlInIFrame);
        }
      }
    }, 100);
  }
}

makeVivliostyleView();
