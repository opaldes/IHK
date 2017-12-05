import {Injectable,PLATFORM_ID,Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {isPlatformServer,Location} from '@angular/common';

//import *  as request from 'request';
//import {isPlatformServer}   from '@angular/common';

@Injectable()
export class DrupalService {
    public baseApi:string;

    constructor(@Inject(PLATFORM_ID) private _platformId:object, private httpClient:HttpClient,private location:Location){
        //TODO create way to store Endpoint more dynamic
        if(isPlatformServer(_platformId)){
            this.baseApi = "https://zmb.agency/drupal/index.php"
        }else{
            console.log(location);
            this.baseApi = "//zmb.agency/drupal/index.php"
        }

    }

    getPage(page:string):Observable<any>{
        console.log(this.baseApi + '/export/pages/' + page);
        return this.httpClient.get(this.baseApi + '/export/pages/' + page);
    }

    getPages():Observable<any>{
        return this.httpClient.get(this.baseApi + '/export/pages/all');
    }

    getParagraph(section:string):Observable<any>{
        return this.httpClient.get(this.baseApi + '/export/paragraphs/' + section);
    }

    getParagraphs():Observable<any>{
        return this.httpClient.get(this.baseApi + '/export/paragraphs/all');

    }

    getHeadBar():Observable<any>{
        return this.httpClient.get(this.baseApi + '/export/headbar');
    }

    getForm(string:string):Observable<any>{
        return this.httpClient.get(this.baseApi + '/webform_rest/elements/'+ string +'?_format=json');
    }

    /**
     * [Because of the limitations of URL Parsing we use ":" as "/" for the cms set url]
     * @param  {string} string [description]
     * @return {[type]}        [description]
     */
    transformUrl2Api(string:string){
        //Remove first slash when applicable
        if(string[0] == "/"){
            string = string.slice(1,string.length);
        }

        return string.replace("/",":");

    }

}
