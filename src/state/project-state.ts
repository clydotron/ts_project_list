import { Project, ProjectStatus } from "../models/projects";

// TODO move into own file (eventually)
type Listener<T> = (projects: T[]) => void

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFcn: Listener<T>) {
    this.listeners.push(listenerFcn);
  }
};

export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState()
    }
    return this.instance
  }

  addProject(title: string, description: string, numPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject)
    this.updateListeners()
  }

  moveProject(projectId: string, status: ProjectStatus) {
    const project = this.projects.find(project => project.id === projectId);
    if (project && project.status !== status ) {
      project.status = status;
      this.updateListeners()
    }
  }

  private updateListeners() {
    for (const listenerFcn of this.listeners) {
      listenerFcn(this.projects.slice());
    }
  }
}
 
export const projectState = ProjectState.getInstance();

