# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: marvin <marvin@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2026/01/30 20:20:33 by marvin            #+#    #+#              #
#    Updated: 2026/01/30 20:20:33 by marvin           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

RM:= rm -rf
VENDOR_DIR := ./vendor
REMOTE_SCRIPT := https://github.com/Univers42/scripts.git

all : vendor

vendor : set_scripts

set_scripts:
	git clone $(REMOTE_SCRIPT) $(VENDOR_DIR)/scripts

clean:
	$(RM) $(VENDOR_DIR)

fclean:clean

re: fclean all

.PHONY: all vendor set_scripts clean fclean re
