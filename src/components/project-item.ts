import { Component } from "./base-component.js" 
import { Draggable } from "../models/drag-drop.js";
import { Project } from "../models/projects.js";


class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get people() {
    if (this.project.people === 1) {
      return '1 person'
    }
    return `${this.project.people} people`
  }

  constructor(hostId: string, project: Project) {
    super('single-project',hostId, false,`project-${project.id}`);
    this.project = project;

    this.configure()
    this.renderContent();
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
    this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.people + " assigned";
    this.element.querySelector('p')!.textContent = this.project.description;
  }

  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(event: DragEvent): void {
  }
}

export default ProjectItem;