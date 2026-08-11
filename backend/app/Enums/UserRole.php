<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case PROJECT_MANAGER = 'project_manager';
    case DEVELOPER = 'developer';
    case QA = 'qa';
}
