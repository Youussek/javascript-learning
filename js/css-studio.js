// css-studio.js — atelier visuel CSS construit sur renderLab(), le même navigateur simulé que JavaScript.
function renderCssStudio(presetId) {
  const files = CSS_STUDIO_PRESETS[presetId];
  if (!files) return h("div",{class:"callout"},para("Aucun atelier CSS n'est configuré pour cette leçon."));
  const lab = renderLab({files:files,previewHeight:300,tips:true,live:true,previewModes:true,resetButton:true});
  return h("section",{class:"css-studio"},
    h("div",{class:"section-heading"},h("div",{},h("span",{class:"eyebrow"},"ATELIER VISUEL"),h("h2",{},"Modifie le CSS, observe immédiatement")),para("Le HTML est verrouillé pour te concentrer sur CSS. La preview est réellement rendue dans une iframe sandboxée.","muted")),
    lab.node);
}
