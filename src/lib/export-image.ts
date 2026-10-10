/** Export the same self-contained SVG that the wardrobe renders, at sharing size. */
export async function exportOutfitImage(svg: SVGSVGElement, name: string): Promise<void> {
  await document.fonts.ready;
  const namespace = "http://www.w3.org/2000/svg";
  const frame = document.createElementNS(namespace, "svg");
  frame.setAttribute("xmlns", namespace);
  frame.setAttribute("width", "1080");
  frame.setAttribute("height", "1350");
  frame.setAttribute("viewBox", "0 0 1080 1350");
  const background = document.createElementNS(namespace, "rect");
  background.setAttribute("width", "1080");
  background.setAttribute("height", "1350");
  background.setAttribute("fill", "#f6f3eb");
  frame.appendChild(background);

  function label(text: string, y: number, size: number, color: string, serif = false) {
    const item = document.createElementNS(namespace, "text");
    item.setAttribute("x", "540");
    item.setAttribute("y", String(y));
    item.setAttribute("text-anchor", "middle");
    item.setAttribute("font-size", String(size));
    item.setAttribute("font-family", serif ? "Georgia, serif" : "Arial, sans-serif");
    item.setAttribute("fill", color);
    item.textContent = text;
    frame.appendChild(item);
  }
  label("VIỆT MIXI", 78, 25, "#ae8051");
  label(name.length > 43 ? `${name.slice(0, 42)}…` : name, 139, 39, "#253f4d", true);
  const figure = svg.cloneNode(true) as SVGSVGElement;
  figure.removeAttribute("class");
  figure.removeAttribute("style");
  figure.setAttribute("x", "90");
  figure.setAttribute("y", "173");
  figure.setAttribute("width", "900");
  figure.setAttribute("height", "1070");
  frame.appendChild(figure);
  label("Một chút truyền thống. Một chút bạn.", 1290, 22, "#777c75");

  const source = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(frame)], {
      type: "image/svg+xml;charset=utf-8",
    }),
  );
  let download: string | undefined;
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Trình duyệt chưa hỗ trợ xuất ảnh. Hãy thử lại bằng trình duyệt khác.");
    context.drawImage(image, 0, 0);
    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Chưa thể tạo ảnh PNG. Hãy thử lại."))),
        "image/png",
      );
    });
    download = URL.createObjectURL(png);
    const anchor = document.createElement("a");
    anchor.href = download;
    anchor.download = `viet-mixi-${
      name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toLowerCase()
        .slice(0, 70) || "bo-phoi"
    }.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(source);
    if (download) {
      const completedDownload = download;
      // Give the browser time to consume the link before releasing the Blob.
      window.setTimeout(() => URL.revokeObjectURL(completedDownload), 1000);
    }
  }
}
