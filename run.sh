#!/bin/ash

set -e
#workaround for azure DNS issue
if [ -n "$MESOS_CONTAINER_NAME"  ]; then 
  echo "search marathon.l4lb.thisdcos.directory" >> /etc/resolv.conf;
fi
sed -i "s/VILKKU_BASIC_AUTH/${VILKKU_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/JOJO_BASIC_AUTH/${JOJO_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/LAPPEENRANTA_BASIC_AUTH/${LAPPEENRANTA_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/LINKKI_BASIC_AUTH/${LINKKI_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/NEW_LISSU_BASIC_AUTH/${NEW_LISSU_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/SAMOCAT_TOKEN_AUTH/${SAMOCAT_TOKEN_AUTH}/" /etc/nginx/external.conf
sed -i "s/transitdatadev/${HSL_RT_STORAGE_NAME}/" /etc/nginx/common.conf
sed -i "s/LAHTI_BASIC_AUTH/${LAHTI_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_KAINUU_BASIC_AUTH/${MATKAHUOLTO_KAINUU_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_SAVO_BASIC_AUTH/${MATKAHUOLTO_SAVO_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_KANTA_BASIC_AUTH/${MATKAHUOLTO_KANTA_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_KARJALA_BASIC_AUTH/${MATKAHUOLTO_KARJALA_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_KESKI_BASIC_AUTH/${MATKAHUOLTO_KESKI_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_KYME_BASIC_AUTH/${MATKAHUOLTO_KYME_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_LAPPI_BASIC_AUTH/${MATKAHUOLTO_LAPPI_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_POHJANMAA_BASIC_AUTH/${MATKAHUOLTO_POHJANMAA_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_SATAKUNTA_BASIC_AUTH/${MATKAHUOLTO_SATAKUNTA_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_VAKKA_BASIC_AUTH/${MATKAHUOLTO_VAKKA_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_VANTAA_BASIC_AUTH/${MATKAHUOLTO_VANTAA_BASIC_AUTH}/" /etc/nginx/external.conf
sed -i "s/MATKAHUOLTO_VARSINAIS_BASIC_AUTH/${MATKAHUOLTO_VARSINAIS_BASIC_AUTH}/" /etc/nginx/external.conf



#start nginx
nginx
