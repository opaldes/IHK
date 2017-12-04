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

    private getSectionType(section:any):string{

        if(section.type && section.type[0]){
            return section.type[0].target_id;
        }

    }

}
/* Page Scheme
[
{"nid":[{"value":2}],
"uuid":[{"value":"ee44a280-7dc7-42da-aac3-edc08183b892"}],
"vid":[{"value":2}],
"langcode":[{"value":"de"}],
"type":[{"target_id":"page","target_type":"node_type","target_uuid":"7860a291-e33b-4a3f-8961-4d26aa45e149"}],
"status":[{"value":true}],
"title":[{"value":"StartSeite"}],
"uid":[{"target_id":1,"target_type":"user","target_uuid":"c3b0a573-5c51-491b-b375-bd26fd552efe","url":"\/drupal\/index.php\/user\/1"}],"created":[{"value":1507125516}],"changed":[{"value":1507126999}],"promote":[{"value":false}],"sticky":[{"value":false}],"revision_timestamp":[{"value":1507125582}],"revision_uid":[{"target_id":1,"target_type":"user","target_uuid":"c3b0a573-5c51-491b-b375-bd26fd552efe","url":"\/drupal\/index.php\/user\/1"}],
"revision_log":[],
"revision_translation_affected":[{"value":true}],
"default_langcode":[{"value":true}],
"field_paragraph":[{"target_id":2,"target_revision_id":2,"target_type":"paragraph","target_uuid":"714509c5-1c88-4cc7-8695-b8dc6f8f4735"},{"target_id":3,"target_revision_id":3,"target_type":"paragraph","target_uuid":"89e634ba-b758-4166-8618-dc392b94a5ad"}],"field_url":[]}]




this.sectionObservable.subscribe((data)=>{
    this.section = data[0];
    try{
        this.type = this.getSectionType();
        console.log(this.type);
        console.log(map[this.type]);
        const factory = this.factoryResolver.resolveComponentFactory(map[this.type]);
        this.component = this.viewContainer.createComponent(factory);
    }catch(error){
        console.error("Could not add Section component for " + this.section + "\n Error: " + error);
    }

    this.component.changeDetectorRef.detectChanges();

})

*/
