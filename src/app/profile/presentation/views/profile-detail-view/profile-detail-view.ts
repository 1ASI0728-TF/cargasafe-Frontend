import { Component } from '@angular/core';
import { ProfileInfo } from '../../components/profile-info/profile-info';

@Component({
  selector: 'app-profile-detail-view',
  imports: [ProfileInfo],
  templateUrl: './profile-detail-view.html',
  styleUrl: './profile-detail-view.css',
})
export class ProfileDetailView {}
