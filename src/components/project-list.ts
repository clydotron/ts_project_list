import { Component } from "./base-component"
import { DragTarget } from "../models/drag-drop";
import { Project, ProjectStatus } from "../models/projects";
import ProjectItem from "./project-item";
import { projectState } from "../state/project-state";


export class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget {
  projects: Project[]

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.projects = []

    this.configure();
    this.renderContent();
  }

  dragOverHandler(event: DragEvent): void {
    // check if drag allowed:
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listElem = this.element.querySelector('ul')!; 
      listElem.classList.add('droppable');
    }
  }

  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(projectId,this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished )
  }

  dragLeaveHandler(_: DragEvent): void {
    const listElem = this.element.querySelector('ul')!; 
    listElem.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
    this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
    this.element.addEventListener('drop', this.dropHandler.bind(this));
    
    projectState.addListener((projects: Project[]) => {
      this.projects = projects.filter(project => {
        if (this.type === 'active') {
          return (project.status === ProjectStatus.Active);
        }

        return (project.status === ProjectStatus.Finished);
      });

      this.renderProjects();
    });
   }
  
  renderContent() {
    const listId = `${this.type}-projects-list`
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    
    // get the list element, clear any existing content
    const listElem = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listElem.innerHTML = ''; 
    for (const project of this.projects) {
      new ProjectItem(this.element.querySelector('ul')!.id, project);
    }
  }
}
