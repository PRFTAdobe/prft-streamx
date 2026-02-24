terraform {
  backend "azurerm" {
    resource_group_name  = "rg-adobe-summit-demo"
    storage_account_name = "tfstatedihsg"
    container_name       = "streamx-tfstate"
    key                  = "monitoring_storage.tfstate"
  }
}
