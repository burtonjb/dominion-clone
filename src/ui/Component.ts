import { TextImage } from "./TextImage";

// A component is a UI component. It is similar to the other view layer components seen in frameworks like react
export interface Component {
  render(): TextImage;
}
