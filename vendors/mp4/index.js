/**
 * 渲染mp4
 */
export default function (buffer, target) {
  const mp4 = document.createElement("video");
  mp4.style.width = "100%";
  mp4.style.height = "100%";
  mp4.controls = true;
  const source = document.createElement("source");
  source.src = URL.createObjectURL(new Blob([buffer]));
  mp4.appendChild(source);
  target.appendChild(mp4);
  target.style.width = "100%";
  target.style.height = "100%";
  target.style.overflow = "hidden";
}
