import {Component,  ComponentFactoryResolver, ViewContainerRef, ComponentRef,ViewEncapsulation} from '@angular/core';
import {DrupalService} from '../../services/DrupalService';
import { Router, NavigationEnd } from '@angular/router';
import { Meta,Title } from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import {HeroSectionComponent} from "../sections/hero/HeroSectionComponent";
import {FormSectionComponent} from "../sections/form/FormSectionComponent";
import {RichTextSectionComponent} from "../sections/imprint/ImprintSectionComponent";

const paragraphDictionary = {
    "heroimage_paragraph" : HeroSectionComponent,
    "form_paragraph" : FormSectionComponent,
    "richtext_paragraph" : RichTextSectionComponent,
    "err-section":"PlaceholderComponent"
};

@Component({
    selector: 'page',
    styleUrls:['./PageComponentStyle.css'],
    template:'',
    encapsulation: ViewEncapsulation.None
})
export class PageComponent {
    public page:Observable<any>;
    public sections:any[];


    private component: ComponentRef<any>;

    constructor(private drupalService:DrupalService, private factoryResolver:ComponentFactoryResolver, private viewContainer:ViewContainerRef, private router:Router, private meta:Meta, private title:Title)
    {

    }

    ngOnInit(){

        this.router.events.subscribe((data)=>{
            if( data instanceof NavigationEnd){
                this.updatePage();
            }
        });

        this.updatePage();

    }

    updatePage() {

        if(this.router.url == "/"){
            this.page = this.drupalService.getPage("startseite");
        }else{
            console.log(this.router.url);
            this.page = this.drupalService.getPage(this.drupalService.transformUrl2Api(this.router.url));
        }
        this.page.subscribe((data:any) =>{
            console.log(data);
            if(data[0].field_paragraph){
                this.setSections(data[0].field_paragraph);
            }
            this.sections = this.sections.map(section => section.toPromise());


            if(data[0].field_description[0]){
                this.meta.updateTag({charset:"utf8",content:data[0].field_description[0].value,name:"description"});
            }

            if(data[0].field_seo_titel[0]){
            this.title.setTitle(data[0].field_seo_titel[0].value as string);
            }else{
            this.title.setTitle(data[0].title[0].value as string);
            }


            Promise.all(this.sections).then(this.onSectionsRdy.bind(this));

        });

    }

    /**
     * [Callback Function executed when all Section promises resolved]
     * @param  {any}    sections [Section]
     */
    onSectionsRdy(sections:any){

        //Its Possible that old view container where loaded so we clear em here
        this.viewContainer.clear();

        sections.forEach((section:any) => {
            try{
                let type = this.getSectionType(section[0]);
                const factory = this.factoryResolver.resolveComponentFactory(paragraphDictionary[type]);
                this.component = this.viewContainer.createComponent(factory);
                this.component.instance.section = section[0];
            }catch(error){
                console.error("Could not add Section component for " + section + "\n Error: " + error);
            }
        });

    }

    public setSections(sections:any[]){
        this.sections = sections.map((section) => {return this.drupalService.getParagraph(section.target_uuid)});
    }

    /**
     * Takes a section and returns it type
     * @param  {any}    section
     * @return {string}         [section Type]
     */
    private getSectionType(section:any):string{

        if(section.type && section.type[0]){
            return section.type[0].target_id;
        }

    }

}
