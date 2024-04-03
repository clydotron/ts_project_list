import { ProjectInput } from "./components/project-input.js";
import { ProjectList } from "./components/project-list.js";

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');