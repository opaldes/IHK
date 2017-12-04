import {Component,Input,HostBinding} from '@angular/core';

@Component({
    selector: 'hero-image-section',
    template: `
    <div class="hero-image-div" [ngStyle]="{'background-image': field_backgroundimage }">
        <h1>
        <span class="title" *ngIf="section.field_header">{{section.field_header[0].value}}</span>
        <br>
        <span class="subtitle" *ngIf="section.field_subheader">{{section.field_subheader[0].value}}</span>
        </h1>
    </div>
    `,
    styleUrls:['./HeroSectionStyle.css'],
})
export class HeroSectionComponent
{

    @Input() section:any;

    headline:any;
    subline:any;
    body:any;
    field_backgroundimage:string = "none";

/*
    @HostBinding( 'style.background' )
    field_backgroundimage:string = "url('http://52.29.161.188/sites/default/files/2017-10/AdobeStock_112468496_Preview_mod.png')";
*/


    public css:any;

    constructor(){}

    ngOnInit()
    {
        this.field_backgroundimage =  'url(' + this.getHeroImageURL() + ')';
    }

    public getHeroImageURL():string
    {
        if(this.section.field_backgroundimage[0]){
            return this.section.field_backgroundimage[0].url;
        }
        return "";
    }


}
