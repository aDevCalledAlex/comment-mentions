import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { CommentSectionComponent } from './components/comment-section/comment-section.component';
import { ContenteditableValueAccessor } from './directives/content-editable-value-accessor.directive';

@NgModule({
  declarations: [
    AppComponent,
    CommentSectionComponent,
    ContenteditableValueAccessor,
  ],
  imports: [BrowserModule, ReactiveFormsModule, FontAwesomeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
