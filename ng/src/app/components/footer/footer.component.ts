import { Component, HostListener, AfterViewInit } from '@angular/core';
import { first } from 'rxjs';

import {
  HttpService,
  UtilService
} from '@app/services';

import animations from './footer.animations';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations
})
export class FooterComponent implements AfterViewInit {

  news: any = [];

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    // TODO: kinda pointless, might add to bad peformance of product page because of scroll listener
    // check if user reached bottom of the page then show footer
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight - 100) {
      !this.show && this.showFooter();
    } else {
      this.show && this.hideFooter();
    }
  }

  constructor(
    private _httpService: HttpService,
    private _utilService: UtilService
  ) {}

  ngAfterViewInit() {
    // this._httpService.fetchNews().pipe(first()).subscribe(data => {
    //   if (data.length === 0 || data.articles.length === 0) {
    //     this.setDefaultNews();
    //     return;
    //   }
    //   this.news = data.articles;
    // });

    this._utilService.loadScript('https://www.instagram.com/embed.js');
    this._utilService.loadScript('https://www.embedista.com/j/instagramfeed.js');
  }

  setNews404Image(ev: any) {
    ev.target.src = '../../../assets/images/img/news-404.png'
  }

  // default news to be used if api fails
  setDefaultNews() {
    this.news = [
      {
        title: 'AI pets could replace dogs and cats, but expert warns that ‘long-term effects’ are unknown',
        publishedAt: 'Aug. 9, 2023',
        author: 'Angelica Stabile, Fox News',
        description: 'Article about how AI could replace pets',
        url: 'https://nypost.com/2023/08/09/ai-pets-could-replace-dogs-and-cats-but-expert-warns-that-long-term-effects-are-unknown/',
        urlToImage: 'https://nypost.com/wp-content/uploads/sites/2/2023/08/NYPICHPDPICT000020270621.jpg?resize=1536,982&quality=75&strip=all'
      },
      {
        title: 'Nobody has lost their job because of what we do,’ says CEO of film industry AI tool',
        publishedAt: 'September 25, 2023',
        author: 'Haje Jan Kamps',
        description: 'Article about how nobody lost their job because of AI',
        url: 'https://techcrunch.com/2023/09/25/ai-writers-strike-film-industry/',
        urlToImage: 'https://techcrunch.com/wp-content/uploads/2023/09/Ofir-Krakowski-deepdub.ai_.jpg?w=1390&crop=1'
      }
    ]
  }

  // did user scroll to the bottom of the page
  show = false;

  // trigger footer show animation
  showFooter() {
    this.show = true;
  }

  // trigger footer hide animation
  hideFooter() {
    this.show = false;
  }

}
