terraform {
  backend "azurerm" {
    resource_group_name  = "rg-adobe-summit-demo"
    storage_account_name = "tfstateo7n14"
    container_name       = "streamx-tfstate"
    key                  = "platform.tfstate"
  }
}
