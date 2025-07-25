# Generated by Django 5.2.3 on 2025-07-20 13:01

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("admins", "0001_initial"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="admin",
            name="admin_passwor_f4a467_idx",
        ),
        migrations.RemoveField(
            model_name="admin",
            name="password_hash",
        ),
        migrations.AddField(
            model_name="admin",
            name="groups",
            field=models.ManyToManyField(
                blank=True,
                help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                related_name="user_set",
                related_query_name="user",
                to="auth.group",
                verbose_name="groups",
            ),
        ),
        migrations.AddField(
            model_name="admin",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="admin",
            name="is_staff",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="admin",
            name="is_superuser",
            field=models.BooleanField(
                default=False,
                help_text="Designates that this user has all permissions without explicitly assigning them.",
                verbose_name="superuser status",
            ),
        ),
        migrations.AddField(
            model_name="admin",
            name="last_login",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="last login"
            ),
        ),
        migrations.AddField(
            model_name="admin",
            name="password",
            field=models.CharField(
                default="password", max_length=128, verbose_name="password"
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="admin",
            name="user_permissions",
            field=models.ManyToManyField(
                blank=True,
                help_text="Specific permissions for this user.",
                related_name="user_set",
                related_query_name="user",
                to="auth.permission",
                verbose_name="user permissions",
            ),
        ),
        migrations.AlterField(
            model_name="admin",
            name="name",
            field=models.CharField(
                default="Top Notes Admin", max_length=255, unique=True
            ),
        ),
    ]
